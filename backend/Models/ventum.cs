using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class ventum
{
    public int id { get; set; }

    public int neto { get; set; }

    public decimal iva { get; set; }

    public DateTime? fecha { get; set; }

    public bool requieredespacho { get; set; }

    public string estado { get; set; } = null!;

    public string id_vendedor { get; set; } = null!;

    public string id_cliente { get; set; } = null!;

    public string? nota { get; set; }

    public virtual ICollection<enviar> enviars { get; set; } = new List<enviar>();

    public virtual ICollection<generar1> generar1s { get; set; } = new List<generar1>();

    public virtual ICollection<generar2> generar2s { get; set; } = new List<generar2>();

    public virtual ICollection<generar3> generar3s { get; set; } = new List<generar3>();

    public virtual ICollection<generar4> generar4s { get; set; } = new List<generar4>();

    public virtual usuario id_clienteNavigation { get; set; } = null!;

    public virtual usuario id_vendedorNavigation { get; set; } = null!;
}

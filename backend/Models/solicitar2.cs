using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class solicitar2
{
    public string id_usuario { get; set; } = null!;

    public int id_servicio { get; set; }

    public int id_cotizacion { get; set; }

    public string id_oferente { get; set; } = null!;

    public int precio { get; set; }

    public int cantidad { get; set; }

    public virtual cotizacion id_cotizacionNavigation { get; set; } = null!;

    public virtual usuario id_oferenteNavigation { get; set; } = null!;

    public virtual servicio id_servicioNavigation { get; set; } = null!;

    public virtual usuario id_usuarioNavigation { get; set; } = null!;

    public virtual valorar valorar { get; set; } = null!;
}

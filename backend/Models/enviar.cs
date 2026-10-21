using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class enviar
{
    public int id_venta { get; set; }

    public int id_mensaje { get; set; }

    public string id_usuario { get; set; } = null!;

    public virtual mensaje id_mensajeNavigation { get; set; } = null!;

    public virtual usuario id_usuarioNavigation { get; set; } = null!;

    public virtual ventum id_ventaNavigation { get; set; } = null!;
}
